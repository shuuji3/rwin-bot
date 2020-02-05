# memo

## 「施設単位」ページのスケジュールのDOMの概要

```html
<tr>
2020/2/12の予定

<td></td> = 10分の空き

<td colspan="6">予定情報</td> = 10 x 6 = 60min の予定

</tr>
```

### 予定なし

予約が入っていない場合、以下の要素が 10分ごとに1つ挿入される。

```html
<td unselectable="on" onclick="set_yoyaku('21','20200212')">&nbsp;</td>
```

### 予定あり

予定が入っている場合、以下のような`<td>`が1つ挿入される。

```html
<td colspan="6" id="target_45628" class="target" onclick="reserve_edit(45628)">
  <div>
    [予約者の名前]<br>[予定の名前]
  </div>
</td>
```

`colspan` の数字は10分をユニットとする予定の時間を表す。`colspan="6"` なら予定は60分である。