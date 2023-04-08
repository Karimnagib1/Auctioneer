import { ApiProperty } from '@nestjs/swagger';
export abstract class LoginBody {
  @ApiProperty({
    example: 'string',
    description: 'The email of the User',
    required: true,
  })
  email: string;
  @ApiProperty({
    example: 'string',
    description: 'The password of the User',
    required: true,
  })
  password: string;
}

export class LoginResponse {
  @ApiProperty({
    example: 'string',
    description: 'The access token of the authenticated user',
  })
  access_token: string;
}
