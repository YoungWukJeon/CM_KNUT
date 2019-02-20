// Created by Young-wuk Jeon on 2017.05.20

var mysql_dbc = require('../commons/db_con') ();
var connection = mysql_dbc.init();

var mysql = {};

module.exports = mysql;