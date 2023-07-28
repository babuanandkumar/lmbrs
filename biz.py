import config
import dao
import base64


def init():
    config.init()


def update_last_logon(user_id):
    return dao.transact([config.sql("UPDATE_LAST_LOGON")], [(user_id,)])


def get_logon_profile(user_id, pwd):
    profiles = dao.fetch(config.sql("LOGIN_USER"), (user_id, str(base64.b64encode(pwd.encode("utf-8")))))
    if profiles is not None and len(profiles) > 0:
        return profiles[0]
    return None


def get_member_profile(member_id):
    profiles = dao.fetch(config.sql("MEMBER_PROFILE"), (member_id, ))
    if profiles is not None and len(profiles) > 0:
        return profiles[0]
    return None


def get_books(title, description, lang_id, order_by, start, limit, recommended):
    sql_key = "SEARCH_RECOMMENDED_BOOKS" if (recommended == "true") else "SEARCH_BOOKS"
    sql_key += "_PUB" if (order_by == "1") else ("_RTG" if (order_by == "2") else "_LKD")
    books = dao.fetch(config.sql(sql_key), ("%" + title.strip().lower() + "%", "%" + description.strip().lower() + "%", int(lang_id), int(start), int(limit)))
    return consolidate_books(books)


def get_all_members_books(title, fname, lname, borrow_status, start, limit):
    books = dao.fetch(config.sql("BORROWALS_ALL_MEMBERS"),
                      ("%" + title.strip().lower() + "%", "%" + fname.strip().lower() + "%",
                       "%" + lname.strip().lower() + "%", borrow_status, start, limit))
    return books



def get_member_books(person_id):
    books = dao.fetch(config.sql("BORROWALS_MEMBER"), (person_id, ))
    return books


def get_all_languages() :
    languages = dao.fetch(config.sql("LANGUAGES"), ())
    return languages


def cancel_borrow(book_copy_id, person_id):
    return dao.transact([config.sql("UPDATE_BOOK_COPY_BORROW_STATUS"), config.sql("CANCEL_BORROW")],
                        [(1, book_copy_id), (book_copy_id, person_id)])


def update_book_copy_status(status, book_copy_id):
    return dao.transact([config.sql("UPDATE_BOOK_COPY_BORROW_STATUS")], [(status, book_copy_id)])


def borrow_if_available(book_id, person_id):
    availability = dao.fetch(config.sql("GET_BOOK_AVAILABILITY"), (book_id, ))
    if len(availability) > 0:
        book_copy_id = availability[0]["id"]
        return dao.transact([config.sql("CREATE_BORROW_RECORD"), config.sql("UPDATE_BOOK_COPY_BORROW_STATUS")],
                     [(book_copy_id, person_id), (2, book_copy_id)])
    return False


def add_copies(book_id, num_copies):
    return dao.transact([config.sql("ADD_COPIES") for i in range(0, num_copies)],
                 [(int(book_id), ) for i in range(0, num_copies)])


def get_members():
    return dao.fetch(config.sql("GET_MEMBERS"), ())


def load_books_rcmnd():
    return dao.fetch(config.sql("BOOKS_RCMND"), ())


def load_books_member_rcmnd(member_id):
    return dao.fetch(config.sql("BOOKS_BORROWED_MEMBER_RCMND"), (member_id, ))


def load_books_other_members_rcmnd(member_id):
    return dao.fetch(config.sql("BOOKS_BORROWED_OTHER_MEMBERS_RCMND"), (member_id,))


def load_books_most_liked_rcmnd():
    return dao.fetch(config.sql("BOOKS_MOST_LIKED_RCMND"), ())


def get_recommended_books(book_ids):
    books = dao.exec(config.sql("RECOMMENDED_BOOKS") % repr(book_ids).replace('[', '(').replace(']', ')'), None)
    return consolidate_books(books)


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
