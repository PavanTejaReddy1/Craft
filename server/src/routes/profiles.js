import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { uploadAvatar as uploadAvatarMiddleware } from '../middleware/upload.js';
import {
  getMyDeveloperProfile, getDeveloperProfile, updateDeveloperProfile,
  addPortfolioItem, updatePortfolioItem, deletePortfolioItem,
  addExperience, deleteExperience,
  addEducation, deleteEducation,
  addCertification, deleteCertification,
  getMyClientProfile, getClientProfile, updateClientProfile,
  uploadAvatar, searchDevelopers,
} from '../controllers/profileController.js';

const router = Router();

// Developer profiles
router.get('/developer/me', authenticate, authorize('developer'), getMyDeveloperProfile);
router.get('/developer/:userId', getDeveloperProfile);
router.patch('/developer', authenticate, authorize('developer'), updateDeveloperProfile);

router.post('/developer/portfolio', authenticate, authorize('developer'), addPortfolioItem);
router.patch('/developer/portfolio/:itemId', authenticate, authorize('developer'), updatePortfolioItem);
router.delete('/developer/portfolio/:itemId', authenticate, authorize('developer'), deletePortfolioItem);

router.post('/developer/experience', authenticate, authorize('developer'), addExperience);
router.delete('/developer/experience/:itemId', authenticate, authorize('developer'), deleteExperience);

router.post('/developer/education', authenticate, authorize('developer'), addEducation);
router.delete('/developer/education/:itemId', authenticate, authorize('developer'), deleteEducation);

router.post('/developer/certifications', authenticate, authorize('developer'), addCertification);
router.delete('/developer/certifications/:itemId', authenticate, authorize('developer'), deleteCertification);

// Client profiles
router.get('/client/me', authenticate, authorize('client'), getMyClientProfile);
router.get('/client/:userId', getClientProfile);
router.patch('/client', authenticate, authorize('client'), updateClientProfile);

// Avatar
router.post('/avatar', authenticate, uploadAvatarMiddleware.single('avatar'), uploadAvatar);

// Developer search
router.get('/developers', searchDevelopers);

export default router;
