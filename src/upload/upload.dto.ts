import { IsNotEmpty } from 'class-validator'; // `IsNotEmpty` экспортируется из `class-validator`
import { HasMimeType, MaxFileSize } from 'nestjs-form-data';

export class UploadImageDto {
  @IsNotEmpty()
  @MaxFileSize(5 * 1024 * 1024) // Максимальный размер файла: 5 MB
  @HasMimeType(['image/jpeg', 'image/png', 'image/gif']) // Допустимые типы файлов
  file: any;
}
