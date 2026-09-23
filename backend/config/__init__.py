import pymysql

pymysql.version_info = (2, 2, 1, "final", 0)
pymysql.install_as_MySQLdb()

# Bypass MariaDB version check for XAMPP MariaDB 10.4.x
from django.db.backends.base.base import BaseDatabaseWrapper
BaseDatabaseWrapper.check_database_version_supported = lambda self: None

from django.db.backends.mysql.features import DatabaseFeatures
DatabaseFeatures.can_return_columns_from_insert = False
DatabaseFeatures.can_return_rows_from_bulk_insert = False
