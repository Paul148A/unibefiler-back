
export class CreateUserDto {
    readonly role: string;

    readonly status: string;

    readonly names: string;

    readonly last_names: string;

    readonly identification: string;

    readonly email: string;

    readonly password: string;

    readonly career?: string;

    readonly semester?: string;
}
