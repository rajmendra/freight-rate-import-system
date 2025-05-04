import express from 'express';
import multer from 'multer';
import { uploadFile, getMappings, getRecords } from '../controllers/freightController';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('file'), uploadFile);
router.get('/mappings', getMappings);
router.get('/records', getRecords);

export default router;
