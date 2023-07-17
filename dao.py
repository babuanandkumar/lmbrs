# import mysql.connector
import config

READ, UPDATE, INSERT, DELETE = 1, 2, 3, 4


def get_connection():
  # conn = mysql.connector.connect(**(config.get("DB_CONFIG")))
  # conn.autocommit = True
  # cursor = conn.cursor(dictionary=True)
  # return conn, cursor
  return None, None


def exec(stmt, tuple, sql_type = 1):
  return None
  # conn, cursor = get_connection()
  # affected = cursor.execute(stmt, tuple)
  # if sql_type == 1: # Read
  #   records = cursor.fetchall()
  #   return records
  # if sql_type == 2: # Update
  #   return affected


def fetch(query, tuple):
  return None
  # return exec(query, tuple, READ)


def update(stmt, tuple):
  return None
  # print(stmt, tuple)
  # return exec(stmt, tuple, UPDATE)





