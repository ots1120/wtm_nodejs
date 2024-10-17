import multer from 'multer';
import path from 'path';

// multer 설정 (이미지 업로드)
const menuImgStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/res/menuImgs/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const reviewImgStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/res/reviewImgs/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

export const menuImgUpload = multer({ storage: menuImgStorage });
export const reviewImgUpload = multer({ storage: reviewImgStorage });
