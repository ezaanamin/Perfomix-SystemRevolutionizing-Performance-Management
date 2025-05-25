

import numpy as np
import pandas as pd
import seaborn as sns

df=pd.read_csv("/content/combined_activities.csv")

df.head()

df.isnull().sum()*100/len(df)

df.isnull().sum()*100/len(df)>90

df=df.drop(columns=["page_new","page_title","page_name","release_GH_node",'release_new_tag','release_prerelease','release_created_at','release_description_length','release_name'
,'review_GH_node','review_status','gitref_description_length'])

df.isnull().sum()*100/len(df)

df['comment_length'].mode()

sns.distplot(df['comment_length'], kde=True, rug=False)

sns.boxplot(df['comment_length'])

df['comment_length'].median()

df['comment_length'].fillna(df['comment_length'].mode(),inplace=True)

df.isnull().sum()

sns.boxplot(df['comment_length'])

sns.distplot(df['comment_length'], kde=True, rug=False)

def IQR_Outlier(column_name):
    upper_limit=df[column_name].quantile(0.75)
    lower_limit=df[column_name].quantile(0.25)
    print(upper_limit,lower_limit)
    IQR=upper_limit -lower_limit
    upper_limit_number=upper_limit + 1.5 *IQR
    lower_limit_number=lower_limit - 1.5 * IQR
    print(upper_limit_number,lower_limit_number)
    return upper_limit_number,lower_limit_number

upper_limit,lower_limit=IQR_Outlier('comment_length')

print("upper_limit",upper_limit)
print("Lower_limit",lower_limit)

new_df=df[df['comment_length']<upper_limit]

sns.boxplot(new_df['comment_length'])

sns.distplot(new_df['comment_length'])

comment_length_median = new_df['comment_length'].median()

new_df['comment_length'] = new_df['comment_length'].fillna(comment_length_median)

new_df_per_75=new_df['comment_length'].quantile(0.75)

new_df_per_75

new_df=new_df[new_df['comment_length']<new_df_per_75]

sns.boxplot(new_df['comment_length'])

sns.distplot(new_df['comment_length'])

new_df.drop(columns=['comment_GH_node'],inplace=True)

new_df.shape

new_df.isnull().sum()/len(df)*100

len(new_df['issue_id'].unique())

sns.boxplot(new_df['issue_id'])

upper_limit_issue_id,lower_limit_issue_id=IQR_Outlier('issue_id')

upper_limit_issue_id

new_df_per_75_issue_id=df['issue_id'].quantile(0.75)

df=df[df['issue_id']<new_df_per_75]

sns.boxplot(df['issue_id'])

sns.distplot(df['issue_id'])

df['issue_id'].isnull().sum()

df['issue_title'].fillna('anonymised',inplace=True)

df.isnull().sum()/len(df)*100

df.drop(columns=['payload_pushed_commits','payload_pushed_distinct_commits','payload_GH_push_id','pull_request_id','pull_request_title'
,'pull_request_created_at','pull_request_status','pull_request_closed_at','pull_request_merged','pull_request_GH_node','payload_pr_commits',
                     'payload_pr_changed_files','gitref_type','gitref_name'
],inplace=True)

df.shape

df.head()

df.drop(columns=['issue_GH_node'
],inplace=True)

df.shape

from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import LabelEncoder

le=LabelEncoder()

def label_encoding(column_name):
    le.fit_transform(df[column_name])
    df[column_name]=le.fit_transform(df[column_name])

df.head()

label_encoding('issue_status')

label_encoding('issue_resolved')

df.head()

df['issue_title'].unique()

df.shape

def convert_date(columns_name):
    df[columns_name]=pd.to_datetime(df[columns_name])

df.isnull().sum()

df.drop(columns=['issue_closed_at'],inplace=True)

df.shape

convert_date('date')
convert_date('issue_created_at')

df['time']=df['date'].dt.time
df['issue_created_at_time']=df['issue_created_at'].dt.time

from datetime import datetime
df['day'] = df['date'].dt.day
df['month'] = df['date'].dt.month
df['year'] = df['date'].dt.year
df['hour']=df['date'].dt.hour
df['minute']=df['date'].dt.minute
df['second']=df['date'].dt.second


df['day_issue_created_date'] = df['issue_created_at'].dt.day
df['month_issue_created_month'] = df['issue_created_at'].dt.month
df['year_issue_created_year'] = df['issue_created_at'].dt.year

df

df.drop(columns=['issue_created_at','comment_GH_node','issue_title'],inplace=True)

df

df['activity'].unique()

from sklearn.preprocessing import OneHotEncoder

df['activity']

df=pd.get_dummies(df,columns=['activity'])

df

df['activity_Commenting issue']

label_encoding('activity_Commenting issue')
label_encoding('activity_Opening issue')
label_encoding('activity_Reopening issue')
label_encoding('activity_Transferring issue')
label_encoding('activity_Closing issue')

df.drop(columns=['type'],inplace=True)

df

df.drop(columns=['contributor','repository','date','time','issue_created_at_time'],inplace=True)

df

from sklearn.model_selection import train_test_split

X=df.drop(columns=['label'])
Y=df['label']

X

Y

X_train,X_test,y_train,y_test=train_test_split(X,Y,test_size=0.2)

from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn import svm
from sklearn import svm

from sklearn.metrics import accuracy_score

# lr=LogisticRegression()
clf=RandomForestClassifier()
# clf1 = svm.SVC(probability=True)
# lr.fit(X_train,y_train)
clf.fit(X_train,y_train)
# clf1.fit(X_train,y_train)

# y_pred=lr.predict(X_test)
y_pred1=clf.predict(X_test)
# y_pred2=clf1.predict(X_test)

# accuracy_score(y_pred,y_test)
accuracy_score(y_pred1,y_test)
# accuracy_score(y_pred2,y_test)

# estimers=[('lr',lr),('rf',clf),('kc',clf1)]

# from sklearn.ensemble import VotingClassifier

# vc=VotingClassifier(estimators=estimers,voting='soft')
# vc1=VotingClassifier(estimators=estimers,voting='hard')

# vc.fit(X_train,y_train)
# vc1.fit(X_train,y_train)

# import warnings
# from sklearn import model_selection
# warnings.filterwarnings("ignore")

# scores = model_selection.cross_val_score(vc, X, Y,
#                                               cv=5,
#                                               scoring='accuracy')
# scores1 = model_selection.cross_val_score(vc1, X, Y,
#                                               cv=5,
#                                               scoring='accuracy')

# print(scores)

# print(scores1)

# import pickle

# pickle.dump(clf,open('pipe.pkl','wb'))

# import pickle
# import numpy as np

# pipe = pickle.load(open('/content/pipe.pkl','rb'))

# test_input = np.array([7.0, 28.0, 0, 1, 3.0, 25, 11, 2022, 9, 56, 8, 10, 8, 2022, 0, 1, 0, 0, 0], dtype=object).reshape(1, 19)

# pipe.predict(test_input)