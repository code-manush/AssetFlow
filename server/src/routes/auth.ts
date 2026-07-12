import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db';
import { JWT_SECRET, authenticate } from '../middleware/auth';

const router = Router();

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ error: 'Name, email, and password are required' });
    return;
  }
  try {
    let { departmentId } = req.body;
    if (!departmentId) {
      const dept = await prisma.department.findFirst();
      if (dept) departmentId = dept.id;
    }
    const existing = await prisma.usersLogin.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        role: 'EMPLOYEE',
        departmentId,
        status: 'ACTIVE',
        userLogin: {
          create: {
            email,
            password: hashedPassword
          }
        }
      },
      include: { userLogin: true }
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, departmentId: user.departmentId } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  try {
    const userLogin = await prisma.usersLogin.findUnique({
      where: { email },
      include: { user: true }
    });

    if (!userLogin || !userLogin.user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, userLogin.password);
    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { id: userLogin.user.id, email: userLogin.user.email, role: userLogin.user.role, name: userLogin.user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: userLogin.user.id, name: userLogin.user.name, email: userLogin.user.email, role: userLogin.user.role, departmentId: userLogin.user.departmentId }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, name: true, email: true, role: true, departmentId: true, status: true }
    });
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
