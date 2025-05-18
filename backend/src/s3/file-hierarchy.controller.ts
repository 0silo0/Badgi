import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  Get,
  Query,
  Param,
  Delete,
  Req,
  UseGuards,
  UnauthorizedException,
  Res,
  Patch,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { S3Service } from './s3.service';
import { CreateFolderDto } from './dto/createfolder.dto';
import { UploadFileDto } from './dto/updatefile.dto';
import { MoveItemDto } from './dto/moveitem.do';
import { FileHierarchyResponseDto } from './dto/FileHierarchyResponse.dto';
// import { BreadcrumbDto } from './dto/breadcrumb.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('file-hierarchy')
@UseGuards(JwtAuthGuard)
export class FileHierarchyController {
  constructor(private readonly s3Service: S3Service) {}

  @Post('folders')
  async createFolder(
    @Body() dto: CreateFolderDto,
    @Req() req: Request,
  ): Promise<FileHierarchyResponseDto> {
    const userId = this.extractUserId(req);
    return this.s3Service.createFolder(userId, dto);
  }

  @Post('files')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadFileDto,
    @Query('parentId') parentId: string,
    @Req() req: Request,
  ): Promise<FileHierarchyResponseDto> {
    const userId = this.extractUserId(req);
    console.log(file)
    console.log(encodeURIComponent(file.originalname))
    return this.s3Service.uploadToHierarchy(file, userId, parentId);
  }

  @Get('tree')
  async getFileTree(
    @Query('parentId') parentId: string,
    @Req() req: Request,
  ): Promise<FileHierarchyResponseDto[]> {
    const userId = this.extractUserId(req);
    return this.s3Service.getFileTree(userId, parentId);
  }

  @Post('move/:itemId')
  async moveItem(
    @Param('itemId') itemId: string,
    @Body() dto: MoveItemDto,
    @Req() req: Request,
  ): Promise<FileHierarchyResponseDto> {
    const userId = this.extractUserId(req);
    return this.s3Service.moveHierarchyItem(itemId, dto.newParentId, userId);
  }

  @Get('download/:id')
  async getFileUrl(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const userId = this.extractUserId(req);
    const { url, name } = await this.s3Service.getFileDownloadUrl(id, userId);

    return {
      url: url,
      name: name,
    };
  }

  @Patch(':id')
  async renameItem(
    @Param('id') id: string,
    @Body() dto: { name: string },
    @Req() req: Request,
  ) {
    const userId = this.extractUserId(req);
    return this.s3Service.updateItemName(id, dto.name, userId);
  }

  @Delete(':itemId')
  async deleteItem(
    @Param('itemId') itemId: string,
    @Req() req: Request,
  ): Promise<void> {
    const userId = this.extractUserId(req);
    return this.s3Service.hardDeleteItem(itemId, userId);
  }

  //   @Get('breadcrumbs/:itemId')
  //   async getBreadcrumbs(
  //     @Param('itemId') itemId: string,
  //   ): Promise<BreadcrumbDto[]> {
  //     return this.s3Service.getBreadcrumbs(itemId);
  //   }

  private extractUserId(req: Request): string {
    const userId = req.user?.primarykey;
    if (!userId) throw new UnauthorizedException('Требуется авторизация');
    return userId;
  }
}
