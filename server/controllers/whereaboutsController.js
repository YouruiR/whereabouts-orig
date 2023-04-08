const db = require('../models/whereaboutsModel');
const bcrypt = require('bcryptjs');
const SALT_WORK_FACTOR = 10;

const whereaboutsController = {};

// LOGIN component middleware

whereaboutsController.checkUserExists = async (req, res, next) => {
  try {
    // check all reqd fields are provided on req body (already checked on FE, so this may not be needed)
    const props = ['phone_number', 'password'];

    if (!props.every((prop) => Object.hasOwn(req.body, prop))) {
      return next({
        log: 'Express error handler caught whereaboutsController.checkUserExists error: Missing phone number or password',
        status: 500,
        message: { error: 'Missing phone number or password' },
      });
    }

    // destructure / sanitize req body
    const { phone_number, password } = req.body;

    // check that a record for passed phone_number exists in users table
    const queryStrCheck = 'SELECT * FROM users u WHERE u.phone_number=$1';
    const existingUser = await db.query(queryStrCheck, [phone_number]);
    if (!existingUser.rows[0]) {
      return next({
        log: 'Express error handler caught whereaboutsController.checkUserExists error: No user exists for input phone number',
        status: 500,
        message: { error: 'No user exists for input phone number' },
      });
    }

    // if user exists in users table, compare user-input password with stored hashed password
    const passwordIsMatch = await bcrypt.compare(
      password,
      existingUser.rows[0].password
    );
    if (!passwordIsMatch) {
      return next({
        log: 'Express error handler caught whereaboutsController.checkUserExists error: Input password is incorrect',
        status: 500,
        message: { error: 'Input password is incorrect' },
      });
    }

    // no need to persist data, only success message needed on FE
    return next();
  } catch (error) {
    return next({
      log: 'Express error handler caught whereaboutsController.checkUserExists error',
      status: 500,
      message: { error: 'User login failed' },
      // message: { error: error.stack }, // for more detailed debugging info
    });
  }
};

// REGISTER component middleware

whereaboutsController.insertNewUser = async (req, res, next) => {
  try {
    // check all reqd fields are provided on req body (already checked on FE, so this may not be needed)
    const props = ['name', 'phone_number', 'password'];

    if (!props.every((prop) => Object.hasOwn(req.body, prop))) {
      return next({
        log: 'Express error handler caught whereaboutsController.insertNewUser error: Missing name, phone number, or password',
        status: 500,
        message: { error: 'Missing name, phone number, or password' },
      });
    }

    // destructure / sanitize req body
    const { name, phone_number, password } = req.body;

    // check user does NOT already exist in users table
    const queryStrCheck = 'SELECT * FROM users u WHERE u.phone_number=$1';
    const existingUser = await db.query(queryStrCheck, [phone_number]);
    if (existingUser.rows[0]) {
      return next({
        log: 'Express error handler caught whereaboutsController.insertNewUser error: A user with this phone number already exists',
        status: 500,
        message: { error: 'A user with this phone number already exists' },
      });
    }

    // salt+hash user-input password
    const hashedPassword = await bcrypt.hash(password, SALT_WORK_FACTOR);

    // insert new user's info (inc hashed password) into users table
    const queryStrInsert =
      'INSERT INTO users(name, phone_number, password) VALUES($1, $2, $3) RETURNING *';

    const insertedUser = await db.query(queryStrInsert, [
      name,
      phone_number,
      hashedPassword,
    ]);

    // no need to persist data, only success message needed on FE
    return next();
  } catch (error) {
    return next({
      log: 'Express error handler caught whereaboutsController.insertNewUser error',
      status: 500,
      message: { error: 'Failed to create new user' },
      // message: { error: error.stack } // for more detailed debugging info
    });
  }
};

module.exports = whereaboutsController;