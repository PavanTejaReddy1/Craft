import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { FILE_LIMITS } from '../constants/index.js';

const createStorage = (destination) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join('uploads', destination));
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${uuidv4()}${ext}`);
    },
  });
};

const fileFilter = (req, file, cb) => {
  if (FILE_LIMITS.ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} not allowed`), false);
  }
};

const maxSize = (Number(process.env.MAX_FILE_SIZE_MB) || 10) * 1024 * 1024;

export const uploadAvatar = multer({
  storage: createStorage('profiles'),
  fileFilter,
  limits: { fileSize: maxSize, files: 1 },
});

export const uploadProjectFiles = multer({
  storage: createStorage('projects'),
  fileFilter,
  limits: { fileSize: maxSize, files: 5 },
});

export const uploadMilestoneFiles = multer({
  storage: createStorage('milestones'),
  fileFilter,
  limits: { fileSize: maxSize, files: 5 },
});
