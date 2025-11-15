import { IsString, IsNotEmpty } from 'class-validator';

export class BranchIdeaDto {
  @IsString()
  @IsNotEmpty()
  branchName: string;
}

