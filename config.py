import json

config = {}
queries = {}
CONFIG_PATH = "static/data/config.json"


def init():
    try:
        load_config()
        load_queries()
    except:
        print("Error Initializing application")


def load_config():
    global config
    config = load_json(CONFIG_PATH)
    print("Config :" + str(config))


def load_json(path):
    f = open(path)
    data = json.load(f)
    f.close()
    return data


def get_dict_value(dict, key, join = False):
    if key in dict.keys():
        if join: return "".join(dict[key])
        else: return dict[key]


def get(name, join = False):
    return get_dict_value(config, name, join)


def sql(name, join = False):
    return get_dict_value(queries, name, join)


def load_queries():
    global queries
    queries = load_json(get("QUERIES_PATH"))
    print("Queries :" + str(queries))
