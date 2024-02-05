import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Users, UsersDocument } from 'src/auth/schema/users';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Users.name)
    private userModel: Model<UsersDocument>,
    private jwtService: JwtService,
  ) {}
  //
  async signUp(signUpDto: SignUpDto): Promise<{ token: string }> {
    const { user_name, user_email, password } = signUpDto;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userModel.create({
      user_name,
      user_email,
      password: hashedPassword,
    });
    const token = this.jwtService.sign({ id: user._id });
    return { token };
  }
  //
  async logIn(loginDto: LoginDto): Promise<{ token: string }> {
    const { user_email, password } = loginDto;
    const user = await this.userModel
      .findOne({ user_email })
      .select('+password');
    if (!user || !(await bcrypt.compare(password, user.password)))
      throw new Error('somthing  went wrong');
    const token = this.jwtService.sign({ id: user._id });
    return { token };
  }
}
