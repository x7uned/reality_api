import { Injectable } from '@nestjs/common';

@Injectable()
export class UploadService {
  // Логика обработки изображений (если требуется)
  handleFile(file: Express.Multer.File) {
    return file.filename;
  }
}
