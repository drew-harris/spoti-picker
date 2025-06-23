let db = $env.DATABASE_URL
def sql [query: string] {
    psql $db --csv -c $query | from csv
}
###

#@ Clear all
sql 'delete from commit_results'
sql 'delete from changelogs'
sql 'delete from log_commit_pairs'
exit
