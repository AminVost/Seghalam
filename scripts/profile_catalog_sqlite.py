"""Host SQLite read-only microbenchmark; explicitly not an Android/JSI performance claim."""
from pathlib import Path
import sqlite3,time,statistics,json
root=Path(__file__).resolve().parents[1]
conn=sqlite3.connect(root/'content/seghalam-catalog.sqlite')
assert conn.execute('PRAGMA integrity_check').fetchone()[0]=='ok'
assert not conn.execute('PRAGMA foreign_key_check').fetchall()
queries=[
 ('recipe-page',"SELECT id,title FROM recipe ORDER BY title LIMIT 24 OFFSET ?",[(i*24)%360 for i in range(250)]),
 ('ingredient-alias',"SELECT ingredient_id FROM ingredient_alias WHERE normalized_alias=?",['گوجه فرنگی','تخم مرغ','بادمجان','برنج']*60),
 ('recipe-contains',"SELECT recipe_id FROM recipe_search WHERE normalized_title LIKE ? LIMIT 24",['%مرغ%','%سوپ%','%پلو%','%سالاد%']*60)
]
results={}
for name,query,params in queries:
 times=[]
 for value in params:
  t=time.perf_counter_ns();conn.execute(query,(value,)).fetchall();times.append((time.perf_counter_ns()-t)/1e6)
 results[name]={'median_ms':round(statistics.median(times),4),'p95_ms':round(sorted(times)[int(.95*len(times))],4),'samples':len(times)}
 print(name,results[name])
print('SQLite integrity PASS; bytes', (root/'content/seghalam-catalog.sqlite').stat().st_size)
(root/'docs/CATALOG_SQLITE_HOST_BENCHMARK.json').write_text(json.dumps({'disclaimer':'Host Python SQLite microbenchmark only, not Android/Hermes profiling','results':results},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
