import { PickType } from "@nestjs/swagger";
import { UserDto } from "./user.dto";


export class CreateUserDto extends PickType(UserDto, [
    'last_names', 'names','email','identification', 'password','role', 'status'
]) {
}
