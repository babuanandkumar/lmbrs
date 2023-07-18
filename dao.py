import mysql.connector
import config

READ, UPDATE, INSERT, DELETE = 1, 2, 3, 4


def get_connection():
  conn = mysql.connector.connect(**(config.get("DB_CONFIG_CLOUD")))
  conn.autocommit = True
  cursor = conn.cursor(dictionary=True)
  return conn, cursor


def exec(stmt, tuple, sql_type = 1):
  conn, cursor = get_connection()
  affected = cursor.execute(stmt, tuple)
  if sql_type == 1: # Read
    records = cursor.fetchall()
    return records
  if sql_type == 2: # Update
    return affected


def fetch(query, tuple):
  return exec(query, tuple, READ)


def update(stmt, tuple):
  #print(stmt, tuple)
  return exec(stmt, tuple, UPDATE)





