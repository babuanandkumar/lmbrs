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


def get_books(title, description, lang_id, order_by, start, limit, recommended):
    if recommended == "true":
        books = dao.fetch(config.sql("SEARCH_RECOMMENDED_BOOKS"), ("%" + title.strip().lower() + "%", "%" + description.strip().lower() + "%", int(lang_id), int(order_by), int(start), int(limit)))
    else:
        books = dao.fetch(config.sql("SEARCH_BOOKS"), ("%" + title.strip().lower() + "%", "%" + description.strip().lower() + "%", int(lang_id), int(order_by), int(start), int(limit)))
    return consolidate_books(books)


def get_all_languages() :
    languages = dao.fetch(config.sql("LANGUAGES"), ())
    return languages


def borrow_if_available(book_id, person_id):
    availability = dao.fetch(config.sql("GET_BOOK_AVAILABILITY"), (book_id, ))
    if len(availability) > 0:
        book_copy_id = availability[0]["id"]
        print("Book Copy Id :" + str(book_copy_id) + " : " + str(person_id))
        dao.exec(config.sql("CREATE_BORROW_RECORD"), (book_copy_id, person_id))
        dao.exec(config.sql("UPDATE_BORROW_STATUS"), (2, book_copy_id))
        return True
    return False


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
