#!/bin/bash

psql -h localhost -U bookapp_user -d bookapp -f database/schema.sql