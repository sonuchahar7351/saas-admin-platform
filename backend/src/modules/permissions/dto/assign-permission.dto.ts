import { IsString, IsUUID } from 'class-validator';

export class AssignPermissionDto {
  @IsUUID()
  userId!: string;

  @IsUUID()
  permissionId!: string;
}
