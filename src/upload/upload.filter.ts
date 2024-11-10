import { BadRequestException } from '@nestjs/common';

export const fileFilter = (req, file, callback) => {
  const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

  // Проверка MIME-типа
  if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
    return callback(
      new BadRequestException('Only image files are allowed!'),
      false,
    );
  }

  // Проверка размера файла
  if (file.size && file.size > MAX_SIZE) {
    return callback(
      new BadRequestException(
        `File size exceeds the maximum limit of ${MAX_SIZE / (1024 * 1024)} MB`,
      ),
      false,
    );
  }

  callback(null, true);
};
