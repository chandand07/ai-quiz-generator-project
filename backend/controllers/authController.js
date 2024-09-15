const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) => {
  const expiresIn = process.env.JWT_EXPIRES_IN || '2h';
  let parsedExpiresIn;

  if (typeof expiresIn === 'string') {
    if (expiresIn.endsWith('d')) {
      parsedExpiresIn = parseInt(expiresIn.slice(0, -1)) * 24 * 60 * 60;
    } else if (expiresIn.endsWith('h')) {
      parsedExpiresIn = parseInt(expiresIn.slice(0, -1)) * 60 * 60;
    } else if (expiresIn.endsWith('m')) {
      parsedExpiresIn = parseInt(expiresIn.slice(0, -1)) * 60;
    } else {
      parsedExpiresIn = parseInt(expiresIn);
    }
  } else {
    parsedExpiresIn = parseInt(expiresIn);
  }

  if (isNaN(parsedExpiresIn)) {
    console.error('Invalid JWT_EXPIRES_IN value:', expiresIn);
    parsedExpiresIn = 2 * 60 * 60; 
  }

  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: parsedExpiresIn
  });
};

exports.signup = async (req, res) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      role: req.body.role,
      school: req.body.school,
      teacherId: req.body.teacherId,
      rollNo: req.body.rollNo,
      class: req.body.class,
      section: req.body.section
    });

    const token = signToken(newUser._id);

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          class: newUser.class,
          section: newUser.section
        }
      }
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email, password, and role'
      });
    }

    const user = await User.findOne({ email, role }).select('+password');
    

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Incorrect email, password, or role'
      });
    }

    const token = signToken(user._id);
    

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          class: user.class,
          section: user.section
        }
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};


exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'You are not logged in! Please log in to get access.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

   
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'The user belonging to this token no longer exists.'
      });
    }

    
    req.user = currentUser;
    next();
  } catch (err) {
    res.status(401).json({
      status: 'fail',
      message: 'Invalid token or authorization failed'
    });
  }
};


exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to perform this action'
      });
    }
    next();
  };
};