import multer from 'multer';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Ensure 'public/uploads/' directory exists
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        // Use a unique filename to prevent collisions
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
    }
});

export const upload = multer({ storage: storage });