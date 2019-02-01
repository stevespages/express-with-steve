:doc:`Home </index>`

Error Handling
==============

The following is an example of throwing an error in Express:

.. code::

   app.get('/next', (req, res, next) => {
       setTimeout(() => {
           return next(new Error('Something is dddddefinitely wrong'));
       })
   });
