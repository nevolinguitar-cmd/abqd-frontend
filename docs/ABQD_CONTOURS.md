ABQD — карта контуров
1) Product pages
Dashboard / CRM

source: apps/crm/

build output: apps/crm/dist/

route: /dashboard/

stage: /__stage/dashboard/

deploy: separate

Constructor

source: frontend/constructor/

route: /constructor/

stage: /__stage/constructor/

deploy: separate

Auth

source: frontend/auth/

route: /auth/

stage: /__stage/auth/

deploy: separate

Account

source: frontend/account/

route: /account/

stage: /__stage/account/

deploy: separate

Tariffs

source: frontend/tariffs/

route: /tariffs/

stage: /__stage/tariffs/

deploy: separate

Public profile

source: frontend/u/

route: /u/

stage: /__stage/u/

deploy: separate

2) Shared layer
Shared assets

source: frontend/assets/

used by: auth / account / constructor / tariffs / u / maybe dashboard

deploy: only separately and consciously

rule: any change here is high-risk and must be checked separately

3) Backend / API
Profiles API

source: /opt/abqd/profiles-api

domain: api.abqd.ru

responsibility:

auth

constructor draft/profile save

crm state

billing/access

media upload

4) Infra environments
Stage frontend root

/var/www/abqd/stage/frontend

Prod frontend root

/var/www/abqd/prod/frontend

Rule

direct edits in stage/prod folders are forbidden as a normal workflow

source of truth must stay in git

5) Future control layer
Admin / CEO panel

future route: /admin/

deploy: fully separate

access: role-protected

responsibility:

infra overview

deploy status

users/subscriptions

crm metrics

logs/health

rollback controls

6) Main rule

one contour = one deploy

one task = one branch

one contour = one PR

no full-site deploy for ordinary tasks
