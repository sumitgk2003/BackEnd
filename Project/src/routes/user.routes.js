import {Router} from 'express';
import {loginUser,registerUser,logoutUser,refreshAccessToken, getUserChannelProfile, subscribe} from '../controllers/user.controller.js'
import {upload} from '../middlewares/multer.middleware.js'
import {verifyJwt} from '../middlewares/auth.middleware.js'
const router=Router();

router.route('/register').post(upload.fields([
  {
    name:'avatar',
    maxCount:1
  },
  {
    name:'coverImage',
    maxCount:1
  }
]),registerUser);

router.route('/login').post(loginUser);

//secured routes
router.route('/logout').post(verifyJwt,logoutUser);
router.route('/refreshAccessToken').post(refreshAccessToken);

router.route('/subscribe').post(verifyJwt,subscribe);

router.route('/c/:username').get(verifyJwt,getUserChannelProfile);
export default router;