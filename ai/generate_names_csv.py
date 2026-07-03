import psycopg2
import pandas as pd
import os

DB_URL = os.getenv("DB_URL", "postgresql://admin:password@database:5432/medisense")

try:
    conn = psycopg2.connect(DB_URL)
    df_districts = pd.read_sql("SELECT id, name FROM districts", conn)
    id_to_name = dict(zip(df_districts['id'], df_districts['name']))
    
    df_data = pd.read_csv("outbreak_data.csv")
    df_data['District_name'] = df_data['district_id'].map(id_to_name)
    
    # Reorder columns to put District_name first and drop district_id
    cols = ['District_name'] + [c for c in df_data.columns if c not in ['district_id', 'District_name']]
    df_data_names = df_data[cols]
    
    df_data_names.to_csv("outbreak_data_with_names.csv", index=False)
    print("Successfully generated outbreak_data_with_names.csv")
except Exception as e:
    print("Error:", e)
