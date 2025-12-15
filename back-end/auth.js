import passport from "passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import db from "./db.js";
import config from "./libs/config.js";


const params = {
    secretOrKey: config.jwtSecret,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
};


const strategy = new Strategy (params, async (payload, done) => {
    try {
        const user = await db.models.User.findByPk(payload.id);

        if (user) {
            return done (null, {
                id: user.id,
                email: user.email
            });
        }
        
        return done (null, false);
    } catch (error) {
        return done (error, false);
    }
});


passport.use(strategy);

export default {
    initialize: () => passport.initialize(),
    authenticate: () => passport.authenticate("jwt", config.jwtSession)
}