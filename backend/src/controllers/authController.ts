import { Request, Response } from 'express';
import { registerUser, loginUser, logoutUser } from '../services/authService';

export const register = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, login, password } = req.body;
    const user = await registerUser(firstName, lastName, email, login, password);
    res.status(201).json(user);
  } catch (error) {
    console.error('Error in register controller:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
};

export const signUp = async (req: Request, res: Response) => {
  try {
    const { login, password } = req.body;
    const token = await loginUser(login, password);
    res.json({ token });
  } catch (error) {
    console.error('Error in login controller:', error);
    res.status(401).json({ message: 'Invalid credentials' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const accountId = req.user?.primarykey;
    if (!accountId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    await logoutUser(accountId);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error in logout controller:', error);
    res.status(500).json({ message: 'Error logging out' });
  }
};