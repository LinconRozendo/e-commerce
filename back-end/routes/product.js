import { Router } from "express";
import db from "../db.js";
import auth from "../auth.js";
import multer from "multer";     
import csv from "csv-parser";     
import fs from "fs";


const router = Router();
const Product = db.models.Product;
const User = db.models.User; 
const { Op } = db.Sequelize; 

const upload = multer({ dest: "uploads/" });


// Rota que trabalha com cadastro de produtos via arquivo .csv
router.route("/products/upload")
    .all(auth.authenticate())
    .post(upload.single("file"), async (req, res) => {
        try {
            const user = await User.findByPk(req.user.id);
            
            if (user.role !== 'seller') {
                if (req.file) fs.unlinkSync(req.file.path);
                return res.status(403).json({ msg: "Apenas vendedores podem importar produtos." });
            }


            if (!req.file) {
                return res.status(400).json({ msg: "Envie um arquivo CSV." });
            }

            const products = [];


            fs.createReadStream(req.file.path)
                .pipe(csv({ 
                    separator: ';', // Define o separador como ponto e vírgula
                    mapHeaders: ({ header }) => {
                        
                        return header
                            .replace(/^\uFEFF/, '') // Remove o BOM (caractere invisível do Excel)
                            .trim()                 // Remove espaços extras
                            .toLowerCase();         // Força minúsculo 
                    }
                })) 
                .on("data", (row) => {
                    if (row.name && row.price) {

                        let priceClean = row.price
                            .toString()
                            .replace(/[^\d.,-]/g, '') // Remove R$, espaços, letras
                            .replace(',', '.');       // Troca vírgula por ponto

                        products.push({
                            name: row.name.trim(),
                            description: row.description ? row.description.trim() : "",
                            price: parseFloat(priceClean), 
                            url: row.url ? row.url.trim() : "",
                            seller_id: req.user.id,
                            sold: false
                        });
                    }
                })
                .on("end", async () => {
                    try {
                        if (products.length === 0) {
                             if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
                             return res.status(400).json({ msg: "Nenhum produto válido encontrado. Verifique se o CSV usa ponto e vírgula (;)." });
                        }

                        // Salva no Banco
                        await Product.bulkCreate(products);

                        // Limpa arquivo temporário
                        fs.unlinkSync(req.file.path);

                        res.status(201).json({ msg: `${products.length} produtos importados com sucesso!` });
                    } catch (error) {
                        console.error("Erro Sequelize:", error);
                        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
                        res.status(500).json({ msg: "Erro ao salvar. Verifique se os dados estão corretos." });
                    }
                })
                .on("error", (error) => {
                    res.status(500).json({ msg: "Erro ao ler o arquivo CSV." });
                });

        } catch (error) {
            res.status(500).json({ msg: error.message });
        }
    });


router.route("/products")
    // Listagem (Busca e Paginação) ---
    .get(async (req, res) => {
        try {
            // Paginação
            const { page = 1, limit = 10, search } = req.query;
            const offset = (page - 1) * limit;

            const where = {
                sold: false // Só mostra produtos NÃO vendidos
            };

            
            if (search) {
                where.name = {
                    [Op.iLike]: `%${search}%` // iLike é case-insensitive (Postgres)
                };
            }

            const products = await Product.findAndCountAll({
                where: where,
                limit: parseInt(limit),
                offset: parseInt(offset),
                order: [['created_at', 'DESC']], // SORT mais recente
                include: [
                    {
                        model: User,
                        as: 'seller',
                        attributes: ['name', 'email'],
                        where: { is_active: true } 
                    }
                ]
            });

            res.json({
                total: products.count,
                totalPages: Math.ceil(products.count / limit),
                currentPage: parseInt(page),
                data: products.rows
            });

        } catch (error) {
            res.status(500).json({ msg: error.message });
        }
    })

    .all(auth.authenticate()) 
    
    // Cadastro (Apenas Vendedores) 
    .post(async (req, res) => {
        try {
            // Verifica se quem está logado é vendedor
            const user = await User.findByPk(req.user.id);
            if (user.role !== 'seller') {
                return res.status(403).json({ msg: "Apenas vendedores podem cadastrar produtos." });
            }

            const newProduct = {
                ...req.body,
                seller_id: req.user.id,
                sold: false 
            };

            const result = await Product.create(newProduct);
            res.status(201).json(result);

        } catch (error) {
            if (error.name === 'SequelizeValidationError') {
                return res.status(400).json({ msg: error.message });
            }
            res.status(412).json({ msg: error.message });
        }
    });


router.route("/products/:id")
    .all(auth.authenticate()) 
    
    .get(async (req, res) => {
        try {
            const product = await Product.findOne({
                where: { id: req.params.id },
                include: [{ 
                    model: User, 
                    as: 'seller', 
                    attributes: ['name', 'email'] 
                }]
            });

            if (!product) {
                return res.sendStatus(404);
            }

            res.json(product);
        } catch (error) {
            res.status(412).json({ msg: error.message });
        }
    })

   
    .put(auth.authenticate(), async (req, res) => {
        try {
            const product = await Product.findByPk(req.params.id);

            if (!product) {
                return res.sendStatus(404);
            }

            // Apenas o vendedor do produto pode editar
            if (product.seller_id !== req.user.id) {
                return res.status(403).json({ msg: "Você não tem permissão para alterar este produto." });
            }

            await product.update(req.body);
            res.json(product); // Retorna o produto atualizado

        } catch (error) {
            res.status(412).json({ msg: error.message });
        }
    })

    
    .delete(async (req, res) => {
        try {
            const product = await Product.findByPk(req.params.id);

            if (!product) {
                return res.sendStatus(404);
            }

            // Apenas vendedor do produto pode editar
            if (product.seller_id !== req.user.id) {
                return res.status(403).json({ msg: "Você não tem permissão para excluir este produto." });
            }

            await product.destroy();
            res.sendStatus(204);

        } catch (error) {
            res.status(412).json({ msg: error.message });
        }
    });

export default router;