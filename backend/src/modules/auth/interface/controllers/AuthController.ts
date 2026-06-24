import { Request, Response } from "express";
import { CookieOptions } from "express";
import { RegisterUserUseCase } from "@/modules/auth/application/use-cases/RegisterUserUseCase";
import { LoginUseCase } from "@/modules/auth/application/use-cases/LoginUseCase";
import { RefreshTokenUseCase } from "@/modules/auth/application/use-cases/RefreshTokenUseCase";
import { LogoutUseCase } from "@/modules/auth/application/use-cases/LogoutUseCase";
import { SessionResult } from "@/modules/auth/application/dtos/AuthDtos";
import {
  REFRESH_COOKIE_NAME,
  REFRESH_COOKIE_PATH,
} from "@/config/constants";
import { isProduction } from "@/config/env";

/** Thin controller: parses request, calls one use case, sends response. */
export class AuthController {
  constructor(
    private readonly registerUser: RegisterUserUseCase,
    private readonly login: LoginUseCase,
    private readonly refresh: RefreshTokenUseCase,
    private readonly logout: LogoutUseCase,
  ) {}

  private cookieOptions(expires: Date): CookieOptions {
    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      path: REFRESH_COOKIE_PATH,
      expires,
    };
  }

  private setSessionCookie(res: Response, session: SessionResult): void {
    res.cookie(
      REFRESH_COOKIE_NAME,
      session.refreshToken,
      this.cookieOptions(session.refreshTokenExpiresAt),
    );
  }

  register = async (req: Request, res: Response): Promise<void> => {
    const session = await this.registerUser.execute(req.body);
    this.setSessionCookie(res, session);
    res
      .status(201)
      .json({ accessToken: session.accessToken, user: session.user });
  };

  loginHandler = async (req: Request, res: Response): Promise<void> => {
    const session = await this.login.execute(req.body);
    this.setSessionCookie(res, session);
    res
      .status(200)
      .json({ accessToken: session.accessToken, user: session.user });
  };

  refreshHandler = async (req: Request, res: Response): Promise<void> => {
    const raw = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
    const session = await this.refresh.execute(raw);
    this.setSessionCookie(res, session);
    res.status(200).json({ accessToken: session.accessToken });
  };

  logoutHandler = async (req: Request, res: Response): Promise<void> => {
    const raw = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
    await this.logout.execute(raw);
    res.clearCookie(REFRESH_COOKIE_NAME, { path: REFRESH_COOKIE_PATH });
    res.status(204).send();
  };
}
