import { Router } from "express";


const router = Router();


router.get("/", async (req, res) => {
    res.json({status: "E-Commerce API"});
});

export default router;
