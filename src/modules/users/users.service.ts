import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { hashPassword } from '@/helpers/util';
import aqp from 'api-query-params';
import mongoose from 'mongoose';
import { CodeAuthDto, CreateAuthDto } from '@/auth/dto/create-auth.dto';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private readonly mailerService: MailerService,
  ) {}

  isEmailExist = async (email: string) => {
    const user = await this.userModel.exists({ email });
    if (user) {
      return true;
    } else return false;
  };
  async create(createUserDto: CreateUserDto) {
    const { email, password, name, phone, address, image } = createUserDto;
    // check email
    if (await this.isEmailExist(email)) {
      throw new BadRequestException(
        `Email exist: ${email}. Please, using another email`,
      );
    }

    // hash pass
    const hashPass = await hashPassword(password);
    const user = await this.userModel.create({
      email,
      password: hashPass,
      name,
      phone,
      address,
      image,
    });
    return { _id: user.id };
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (current - 1) * pageSize;
    const results = await this.userModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .select('-password')
      .sort(sort as any);
    return { results, totalPages };
  }

  findOne(_id: string) {
    return `This action returns a #${_id} user`;
  }

  async findByEmail(email: string) {
    return await this.userModel.findOne({ email });
  }

  async update(updateUserDto: UpdateUserDto) {
    return await this.userModel.updateOne(
      { _id: updateUserDto._id },
      { ...updateUserDto },
    );
  }

  async remove(_id: string) {
    if (mongoose.isValidObjectId(_id)) {
      return this.userModel.deleteOne({ _id });
    } else {
      throw new BadRequestException('Invalid ID');
    }
  }

  async handleRegister(registerDto: CreateAuthDto) {
    const { email, password, name } = registerDto;
    // check email
    if (await this.isEmailExist(email)) {
      throw new BadRequestException(
        `Email exist: ${email}. Please, using another email`,
      );
    }

    // hash pass
    const hashPass = await hashPassword(password);
    const codeId = uuidv4();
    const user = await this.userModel.create({
      email,
      password: hashPass,
      name,
      isActive: false,
      codeId: codeId,
      codeExpired: dayjs().add(5, 'minutes'),
    });

    this.mailerService.sendMail({
      to: user.email, // list of receivers
      subject: 'Activate your account !!!', // Subject line
      text: 'welcome', // plaintext body
      template: 'register.hbs',
      context: {
        name: user?.name ?? user.email,
        activationCode: user.codeId,
      },
    });
    // return response
    return { _id: user.id };
    // send email
  }

  async handleActive(codeDto: CodeAuthDto) {
    const user = await this.userModel.findOne({
      _id: codeDto._id,
      codeId: codeDto.code,
    });
    // check user
    if (!user) {
      throw new BadRequestException('The code is invalid or has expired');
    }

    // check expire code
    const checkIsBefore = dayjs().isBefore(user.codeExpired);
    if (checkIsBefore) {
      // update user
      await this.userModel.updateOne(
        { _id: codeDto._id },
        {
          isActive: true,
        },
      );
    } else {
      throw new BadRequestException('The code is invalid or has expired');
    }
    return checkIsBefore;
  }
}
