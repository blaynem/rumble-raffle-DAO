import express from 'express';

const router = express.Router();

router.use('/rooms', require('./rooms'));
router.use('/activities', require('./activities').router);
router.use('/contracts', require('./contracts'));

router.use(function(err, req, res, next){
  if(err.name === 'ValidationError'){
    return res.status(422).json({
      errors: Object.keys(err.errors).reduce(function(errors, key){
        errors[key] = err.errors[key].message;

        return errors;
      }, {})
    });
  }

  return next(err);
});

module.exports = router;