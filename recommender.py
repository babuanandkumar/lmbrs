import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import nltk
from nltk.corpus import stopwords
import biz
import re


tfidf_vectorizer = None
tfidf_matrix = None
stop_words = None
book_ids = None


def start():
    global stop_words
    if not stop_words:
        nltk.download('stopwords')
        stop_words = stopwords.words('english')
    print("Recommender ==> Building Sparse Matrix")
    build_sparse_matrix()
    print("Recommender ==> Sparse Matrix Built")


def process_text(column):
    column = column.str.replace('http\S+|www.\S+|@|%|:|,|', '', case=False)
    word_tokens = column.str.split()
    keywords = word_tokens.apply(lambda x: [item for item in x if item not in stop_words])
    for i in range(len(keywords)):
        keywords[i] = " ".join(keywords[i])
        column = keywords
    return column


def build_sparse_matrix():
    global tfidf_vectorizer, tfidf_matrix, book_ids
    books = biz.load_books_rcmnd()
    books_df = pd.DataFrame(books)
    books_df['Combined'] = process_text(books_df['Combined'])
    re_exp = r"\,"
    tfidf_vectorizer = TfidfVectorizer(tokenizer = lambda text: re.split(re_exp, text))
    tfidf_matrix = tfidf_vectorizer.fit_transform(books_df["Combined"])
    book_ids = list(books_df["id"])


def get_recommendation(member_id):
    global tfidf_vectorizer, tfidf_matrix, book_ids
    books = biz.load_books_member_rcmnd(member_id)
    borrowed = True
    # Address the cold start issue here. If there is no substantial number of books borrowed by the member earlier,
    # get the recent books borrowed by other users
    if len(books) < 20:
        borrowed = False
        books =biz.load_books_other_members_rcmnd(member_id)
        # If the number is still small, get top 50 most liked books by members.
        if len(books) < 50:
            books = biz.load_books_most_liked_rcmnd()
    books = pd.DataFrame(books)
    book_vectors = tfidf_vectorizer.transform(books['Combined'])
    cosine_sim = cosine_similarity(book_vectors, tfidf_matrix)
    book_indices = cosine_sim.argsort()[:, -50 - 1:-1]
    return get_recommended_book_ids(books, book_indices, borrowed)


def get_recommended_book_ids(books, book_indices, borrowed):
    recommended_book_ids = []
    borrowed_book_ids = []
    if borrowed: borrowed_book_ids = list(books.keys())
    for row in book_indices:
        for book_index in row:
            book_id = book_ids[book_index]
            if not book_id in borrowed_book_ids:
                recommended_book_ids.append(book_id)
            if len(recommended_book_ids) >= 50:
                return recommended_book_ids
    return []

