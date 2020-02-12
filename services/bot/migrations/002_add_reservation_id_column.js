exports.up = function(knex) {
  return knex.schema.alterTable('schedules', table => {
    table.integer('reservationID');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('schedules', table => {
    table.dropColumn('reservationID');
  });
};
