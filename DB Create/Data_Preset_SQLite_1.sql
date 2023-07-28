INSERT INTO person_status(status) VALUES ('Active'), ('Suspended'), ('Deleted');

INSERT INTO borrow_status(status) VALUES ('Available'), ('Borrow Blocked'), ('Borrowed'), ('Return Waiting'), ('Returned');

INSERT INTO person(f_name, l_name, email, logon_id, password, last_logged_on, is_admin, status_id, created_by, created_on) 
 VALUES ('Anand kumar', 'Babu', 'anbabu@iu.edu', 'anbabu', 'b''YW1vb25ndXNz''', '2023-07-08', 1, 1, 1, CURRENT_TIMESTAMP), 
		('Carmen', 'Galgano', 'cgalgano@iu.edu', 'cgalgano', 'b''YXJhcXVhbmlk''', '2023-07-08', 0, 1, 1, CURRENT_TIMESTAMP), 
        ('Braxton Thatcher', 'Ratekin', 'btrateki@iupui.edu', 'btrateki', 'b''YmVoZWV5ZW0=''', '2023-07-08', 1, 1, 1, CURRENT_TIMESTAMP),
        ('Rachel', 'Booker', 'rachel@unknown.com', 'booker12', 'b''YmxhY2VwaGFsb24=''', '2023-07-08', 0, 1, 1, CURRENT_TIMESTAMP),
        ('Laura', 'Grey', 'laura@unknown.com', 'grey07', 'b''Y2VsZXN0ZWVsYQ==''', '2023-07-08', 0, 1, 1, CURRENT_TIMESTAMP),
        ('Craig', 'Johnson', 'craig@unknown.com', 'johnson81', 'b''Y2hhcm1hbmRlcg==''', '2023-07-08', 0, 1, 1, CURRENT_TIMESTAMP),
        ('Mary', 'Jenkins', 'mary@unknown.com', 'jenkins46', 'b''ZHJhZ2FwdWx0''', '2023-07-08', 0, 1, 1, CURRENT_TIMESTAMP),
        ('Jamie', 'Smith', 'jamie@unknown.com', 'smith79', 'b''ZHVuc3BhcmNl''', '2023-07-08', 0, 1, 1, CURRENT_TIMESTAMP);

