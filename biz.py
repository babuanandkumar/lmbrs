import config
import dao
from flask import jsonify


def init():
    config.init()


def update_last_logon(user_id):
    print("Update last logon")
    return dao.update(config.sql("UPDATE_LAST_LOGON"), (user_id,))


def get_logon_profile(user_id, pwd):
    profiles = dao.fetch(config.sql("LOGIN_USER"), (user_id, pwd))
    if profiles is not None and len(profiles) > 0:
        return profiles[0]
    return None


def get_new_publications(start, limit):
    new_publications = dao.fetch(config.sql("NEW_PUBLICATIONS"), (start, limit))
    return consolidate_books(new_publications)


def consolidate_books(books_list):
    books = {}
    for book in books_list:
        if not book["id"] in books.keys():
            id = book["id"]
            books[id] = book.copy()
            books[id]["author"] = [book["author"]]
            books[id]["award"] = [book["award"]]
            books[id]["format"] = [book["format"]]
            books[id]["genre"] = [book["genre"]]
        else:
            if book["author"] not in books[id]["author"]: books[id]["author"].append(book["author"])
            if book["award"] not in books[id]["award"]: books[id]["award"].append(book["award"])
            if book["format"] not in books[id]["format"]: books[id]["format"].append(book["format"])
            if book["genre"] not in books[id]["genre"]: books[id]["genre"].append(book["genre"])
    return list(books.values())


