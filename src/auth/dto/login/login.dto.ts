import { IsNotEmpty, IsString } from "class-validator";


export class LoginDto {
  @IsString()
  @IsNotEmpty()
  identification: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
