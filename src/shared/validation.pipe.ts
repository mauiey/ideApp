import { PipeTransform, Injectable, ArgumentMetadata, HttpException, HttpStatus } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class ValidationPipe2 implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata) {
    console.log('VALIDATION - 1');
    if (value instanceof Object && this.isEmpty(value)){
        throw new HttpException('Validation failed: No body submitted', HttpStatus.BAD_REQUEST);
    }

    const {metatype} = metadata;
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = plainToClass(metatype, value);
    const errors = await validate(object);
    if (errors.length > 0) {
      throw new HttpException(`Validation failed: ${this.formatErrors(errors)}`, HttpStatus.BAD_REQUEST);
    }
    return value;
  }

  private toValidate(metatype: Function): boolean {
    console.log('VALIDATION - 2');

    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(type => metatype === type);
  }

  private formatErrors(errors: any[]){
    console.log('VALIDATION - 3');
    return errors.map(err => {
        for (let property in err.constraints) {
            return err.constraints[property];
        }
    }).join(', ');
  }

  private isEmpty(value:any){
    console.log('VALIDATION - 4');

      if (Object.keys(value).length > 0){
          return false;
      }
      return true;
  }
}