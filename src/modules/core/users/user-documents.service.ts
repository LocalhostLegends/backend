import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDocument } from '@database/entities/user-document.entity';
import { StorageService } from '@modules/storage/storage.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { DocumentStatus } from '@common/enums/document-status.enum';
import { UserDocumentResponseDto } from './dto/user-document-response.dto';
import { UpdateDocumentStatusDto } from './dto/update-document-status.dto';

@Injectable()
export class UserDocumentsService {
  constructor(
    @InjectRepository(UserDocument)
    private readonly _documentRepository: Repository<UserDocument>,
    private readonly _storageService: StorageService,
  ) {}

  async upload(
    userId: string,
    companyId: string,
    file: Express.Multer.File,
    dto: UploadDocumentDto,
    uploadedById: string,
  ): Promise<UserDocumentResponseDto> {
    const path = `${companyId}/${userId}/${dto.category}`;
    const { key } = await this._storageService.uploadPrivateFile(file, path);

    const document = this._documentRepository.create({
      userId,
      companyId,
      name: dto.name,
      fileName: file.originalname,
      key,
      category: dto.category,
      status: DocumentStatus.PENDING,
      mimeType: file.mimetype,
      size: file.size,
      metadata: dto.metadata,
      uploadedById,
    });

    const saved = await this._documentRepository.save(document);
    const url = await this._storageService.getSignedUrl(saved.key);

    return this.mapToDto(saved, url);
  }

  async findAll(userId: string): Promise<UserDocumentResponseDto[]> {
    const documents = await this._documentRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    return Promise.all(
      documents.map(async (doc) => {
        const url = await this._storageService.getSignedUrl(doc.key);
        return this.mapToDto(doc, url);
      }),
    );
  }

  async findOne(id: string, userId: string): Promise<UserDocumentResponseDto> {
    const document = await this._documentRepository.findOne({
      where: { id, userId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const url = await this._storageService.getSignedUrl(document.key);
    return this.mapToDto(document, url);
  }

  async updateStatus(
    id: string,
    userId: string,
    dto: UpdateDocumentStatusDto,
  ): Promise<UserDocumentResponseDto> {
    const document = await this._documentRepository.findOne({
      where: { id, userId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    document.status = dto.status;
    if (dto.notes) {
      document.metadata = {
        ...document.metadata,
        notes: dto.notes,
      };
    }

    const saved = await this._documentRepository.save(document);
    const url = await this._storageService.getSignedUrl(saved.key);

    return this.mapToDto(saved, url);
  }

  async remove(id: string, userId: string): Promise<void> {
    const document = await this._documentRepository.findOne({
      where: { id, userId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    await this._storageService.deleteFile(document.key);
    await this._documentRepository.remove(document);
  }

  private mapToDto(doc: UserDocument, url: string): UserDocumentResponseDto {
    return {
      id: doc.id,
      name: doc.name,
      fileName: doc.fileName,
      category: doc.category,
      status: doc.status,
      mimeType: doc.mimeType,
      size: doc.size,
      url: url,
      metadata: doc.metadata,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
