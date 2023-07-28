# import mysql.connector
import sqlite3
import config

READ, UPDATE, INSERT, DELETE = 1, 2, 3, 4


def get_connection():
  # conn = mysql.connector.connect(**(config.get("DB_CONFIG_LOCAL")))
  conn = sqlite3.connect(config.get("SQLITE_DB_NAME"))
  conn.row_factory = lambda c, r: dict(zip([col[0] for col in c.description], r))
  # conn.autocommit = True
  cursor = conn.cursor()
  return conn, cursor


def exec(stmt, tuple, sql_type = 1):
  conn, cursor = get_connection()
  affected = cursor.execute(stmt, tuple) if not tuple is None else cursor.execute(stmt)
  if sql_type == 1: # Read
    records = cursor.fetchall()
    cursor.close()
    return records
  if sql_type == 2: # Update
    cursor.close()
    return affected


def fetch(query, tuple):
  return exec(query, tuple, READ)


def update(stmt, tuple):
  return exec(stmt, tuple, UPDATE)


def transact(stmts, tuples):
  conn, cursor = get_connection()
  cursor.execute("Begin")
  try:
    for i in range(0, len(stmts)):
      cursor.execute(stmts[i], tuples[i])
    cursor.execute("Commit")
    cursor.close()
    return True
  except:
    try:
      cursor.execute("Rollback")
      cursor.close()
      return False
    except:
      return False






