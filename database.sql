model COMPANY {
  id          String      @unique @map("ID") @db.Uuid
  companyId   Int         @id @default(autoincrement()) @map("COMPANY_ID")
  companyName String      @map("COMPANY_NAME")
  status      ENUMSTATUS  @default(ENABLE) @map("STATUS")
  createdAt   DateTime    @default(now()) @map("CREATED_AT") @db.Timestamp(6)
  updatedAt   DateTime    @updatedAt @map("UPDATED_AT") @db.Timestamp(6)
  deletedAt   DateTime?   @map("DELETED_AT") @db.Timestamp(6)
  orgUnits    ORG_UNITS[]

  @@map("COMPANY")
}

model ORG_UNITS {
  id           String      @unique @map("ID") @db.Uuid
  orgUnitId    Int         @id @default(autoincrement()) @map("ORG_UNIT_ID")
  orgUnitCode  String      @unique @map("ORG_UNIT_CODE")
  unitName     String      @map("UNIT_NAME")
  unitType     String?     @map("UNIT_TYPE")
  companyId    Int?        @map("COMPANY_ID")
  parentUnitId Int?        @map("PARENT_UNIT_ID")
  branchId     Int?        @map("BRANCH_ID")
  status       ENUMSTATUS  @default(ENABLE) @map("STATUS")
  createdAt    DateTime    @default(now()) @map("CREATED_AT") @db.Timestamp(6)
  updatedAt    DateTime?   @updatedAt @map("UPDATED_AT") @db.Timestamp(6)
  deletedAt    DateTime?   @map("DELETED_AT") @db.Timestamp(6)
  employees    EMPLOYEES[]
  branch       BRANCHES?   @relation(fields: [branchId], references: [branchId])
  company      COMPANY?    @relation(fields: [companyId], references: [companyId])
  parentUnit   ORG_UNITS?  @relation("OrgUnitTree", fields: [parentUnitId], references: [orgUnitId])
  childUnits   ORG_UNITS[] @relation("OrgUnitTree")

  @@index([branchId])
  @@index([companyId])
  @@index([parentUnitId])
  @@map("ORG_UNITS")
}

model BRANCHES {
  id         String      @unique @map("ID") @db.Uuid
  branchId   Int         @id @default(autoincrement()) @map("BRANCH_ID")
  branchCode String      @unique @map("BRANCH_CODE")
  branchName String      @map("BRANCH_NAME")
  location   String?     @map("LOCATION")
  status     ENUMSTATUS  @default(ENABLE) @map("STATUS")
  createdAt  DateTime    @default(now()) @map("CREATED_AT") @db.Timestamp(6)
  updatedAt  DateTime?   @updatedAt @map("UPDATED_AT") @db.Timestamp(6)
  deletedAt  DateTime?   @map("DELETED_AT") @db.Timestamp(6)
  orgUnits   ORG_UNITS[]

  @@map("BRANCHES")
}

model POSITIONS {
  id           String      @unique @map("ID") @db.Uuid
  positionId   Int         @id @default(autoincrement()) @map("POSITION_ID")
  positionName String      @map("POSITION_NAME")
  level        String      @map("LEVEL")
  status       ENUMSTATUS  @default(ENABLE) @map("STATUS")
  createdAt    DateTime    @default(now()) @map("CREATED_AT") @db.Timestamp(6)
  updatedAt    DateTime?   @updatedAt @map("UPDATED_AT") @db.Timestamp(6)
  deletedAt    DateTime?   @map("DELETED_AT") @db.Timestamp(6)
  employees    EMPLOYEES[]

  @@map("POSITIONS")
}

model EMPLOYEES {
  id           String             @unique @map("ID") @db.Uuid
  employeeId   Int                @id @default(autoincrement()) @map("EMPLOYEE_ID")
  employeeCode String             @unique @map("EMPLOYEE_CODE")
  firstName    String             @map("FIRST_NAME")
  lastName     String             @map("LAST_NAME")
  phone        String?            @map("PHONE")
  email        String?            @map("EMAIL")
  birthDate    DateTime?          @map("BIRTH_DATE") @db.Date
  unitId       Int?               @map("UNIT_ID")
  positionId   Int?               @map("POSITION_ID")
  description  String?            @map("DESCRIPTION")
  status       ENUMSTATUS         @default(ENABLE) @map("STATUS")
  isAccount    Boolean            @default(false) @map("IS_ACCOUNT")
  createdAt    DateTime           @default(now()) @map("CREATED_AT") @db.Timestamp(6)
  updatedAt    DateTime?          @updatedAt @map("UPDATED_AT") @db.Timestamp(6)
  deletedAt    DateTime?          @map("DELETED_AT") @db.Timestamp(6)
  accounts     ACCOUNTS[]
  position     POSITIONS?         @relation(fields: [positionId], references: [positionId])
  orgUnit      ORG_UNITS?         @relation(fields: [unitId], references: [orgUnitId])
  ips          IPS[]
  viettel      VIETTEL_EMPLOYEES?

  @@index([unitId])
  @@index([positionId])
  @@map("EMPLOYEES")
}

model ACCOUNTS {
  id          String     @unique @map("ID") @db.Uuid
  accountId   Int        @id @default(autoincrement()) @map("ACCOUNT_ID")
  accountName String     @unique(map: "ACCOUNTS_ACCOUNT_CODE_key") @map("ACCOUNT_NAME")
  password    String?    @map("PASSWORD")
  isLogin     Boolean    @default(false) @map("IS_LOGIN")
  login       Int        @default(0) @map("LOGIN")
  description String?    @map("DESCRIPTION") @db.VarChar(255)
  employeeId  Int?       @unique @map("EMPLOYEE_ID")
  status      ENUMSTATUS @default(ENABLE) @map("STATUS")
  createdAt   DateTime   @default(now()) @map("CREATED_AT") @db.Timestamp(6)
  updatedAt   DateTime?  @updatedAt @map("UPDATED_AT") @db.Timestamp(6)
  deletedAt   DateTime?  @map("DELETED_AT") @db.Timestamp(6)

  accountRoles        ACCOUNT_ROLES[]
  grantedPermissions  ROLE_PERMISSIONS[] @relation("PermissionGranter")
  employee            EMPLOYEES?         @relation(fields: [employeeId], references: [employeeId])
  otpTokens           OTP_TOKENS[]
  refreshTokens       REFRESH_TOKENS[]

  @@index([employeeId])
  @@map("ACCOUNTS")
}

model ACCOUNT_ROLES {
  id        String    @unique @map("ID") @db.Uuid
  arId      Int       @id @default(autoincrement()) @map("AR_ID")
  roleId    Int       @map("ROLE_ID")
  accountId Int       @map("ACCOUNT_ID")
  createdAt DateTime  @default(now()) @map("CREATED_AT") @db.Timestamp(6)
  updatedAt DateTime? @updatedAt @map("UPDATED_AT") @db.Timestamp(6)
  deletedAt DateTime? @map("DELETED_AT") @db.Timestamp(6)

  account ACCOUNTS @relation(fields: [accountId], references: [accountId])
  role    ROLES    @relation(fields: [roleId], references: [roleId])

  @@index([accountId])
  @@index([roleId])
  @@map("ACCOUNT_ROLES")
}

model ROLES {
  id          String     @unique @map("ID") @db.Uuid
  roleId      Int        @id @default(autoincrement()) @map("ROLE_ID")
  roleCode    String     @unique @map("ROLE_CODE") @db.VarChar(50)
  roleName    String     @map("ROLE_NAME")
  description String?    @map("DESCRIPTION")
  createdBy   Int?       @map("CREATED_BY")
  updatedBy   Int?       @map("UPDATED_BY")
  status      ENUMSTATUS @default(ENABLE) @map("STATUS")
  createdAt   DateTime   @default(now()) @map("CREATED_AT") @db.Timestamp(6)
  updatedAt   DateTime?  @updatedAt @map("UPDATED_AT") @db.Timestamp(6)
  deletedAt   DateTime?  @map("DELETED_AT") @db.Timestamp(6)

  accountRoles    ACCOUNT_ROLES[]
  rolePermissions ROLE_PERMISSIONS[]

  @@map("ROLES")
}

model ROLE_PERMISSIONS {
  id        String    @unique @map("ID") @db.Uuid
  rpId      Int       @id @default(autoincrement()) @map("RP_ID")
  roleId    Int       @map("ROLE_ID")
  perId     Int       @map("PER_ID")
  grantedBy Int       @map("GRANTED_BY")
  revokedAt DateTime? @map("REVOKED_AT")
  createdAt DateTime  @default(now()) @map("CREATED_AT") @db.Timestamp(6)
  updatedAt DateTime? @updatedAt @map("UPDATED_AT") @db.Timestamp(6)
  deletedAt DateTime? @map("DELETED_AT") @db.Timestamp(6)

  role       ROLES       @relation(fields: [roleId], references: [roleId])
  permission PERMISSIONS @relation(fields: [perId], references: [perId])
  granter    ACCOUNTS    @relation("PermissionGranter", fields: [grantedBy], references: [accountId])

  @@index([roleId])
  @@index([perId])
  @@index([grantedBy])
  @@map("ROLE_PERMISSIONS")
}

model PERMISSIONS {
  id        String     @unique @map("ID") @db.Uuid
  perId     Int        @id @default(autoincrement()) @map("PER_ID")
  perCode   String     @unique @map("PER_CODE") @db.VarChar(100)
  perName   String     @map("PER_NAME")
  apiPath   String?    @map("API_PATH")
  method    String?    @map("METHOD")
  notes     String?    @map("NOTES")
  status    ENUMSTATUS @default(ENABLE) @map("STATUS")
  createdAt DateTime   @default(now()) @map("CREATED_AT") @db.Timestamp(6)
  updatedAt DateTime?  @updatedAt @map("UPDATED_AT") @db.Timestamp(6)
  deletedAt DateTime?  @map("DELETED_AT") @db.Timestamp(6)

  rolePermissions ROLE_PERMISSIONS[]

  @@map("PERMISSIONS")
}

model VLANS {
  id             String         @unique @map("ID") @db.Uuid
  vlanId         Int            @id @map("VLAN_ID")
  vlanName       String         @map("VLAN_NAME")
  network        String?        @map("NETWORK")
  defaultGateway String?        @map("DEFAULT_GATEWAY")
  subnetMask     String?        @map("SUBNET_MASK")
  ipRange        String         @map("IP_RANGE")
  status         NETWORK_STATUS @default(ACTIVE) @map("STATUS")
  createdAt      DateTime       @default(now()) @map("CREATED_AT") @db.Timestamp(6)
  updatedAt      DateTime?      @updatedAt @map("UPDATED_AT") @db.Timestamp(6)
  deletedAt      DateTime?      @map("DELETED_AT") @db.Timestamp(6)
  ips            IPS[]

  @@map("VLANS")
}

model IPS {
  id         String         @unique @map("ID") @db.Uuid
  ipId       Int            @id @default(autoincrement()) @map("IP_ID")
  host       String         @map("HOST")
  vlanId     Int            @map("VLAN_ID")
  deviceType String?        @map("DEVICE_TYPE")
  employeeId Int?           @map("EMPLOYEE_ID")
  status     NETWORK_STATUS @default(INACTIVE) @map("STATUS")
  createdAt  DateTime       @default(now()) @map("CREATED_AT") @db.Timestamp(6)
  updatedAt  DateTime?      @updatedAt @map("UPDATED_AT") @db.Timestamp(6)
  deletedAt  DateTime?      @map("DELETED_AT") @db.Timestamp(6)
  employee   EMPLOYEES?     @relation(fields: [employeeId], references: [employeeId])
  vlan       VLANS          @relation(fields: [vlanId], references: [vlanId])

  @@index([employeeId])
  @@index([vlanId])
  @@map("IPS")
}

model VIETTEL_EMPLOYEES {
  id              String          @unique @map("ID") @db.Uuid
  viettelId       Int             @id @default(autoincrement()) @map("VIETTEL_ID")
  viettelCode     String          @unique @map("VIETTEL_CODE")
  viettelEmail    String          @unique @map("VIETTEL_EMAIL")
  viettelPosition String?         @map("VIETTEL_POSITION")
  viettelBranchId Int?            @map("VIETTEL_BRANCH_ID")
  employeeId      Int             @unique @map("EMPLOYEE_ID")
  status          ENUMSTATUS      @default(ENABLE) @map("STATUS")
  createdAt       DateTime        @default(now()) @map("CREATED_AT") @db.Timestamp(6)
  updatedAt       DateTime?       @updatedAt @map("UPDATED_AT") @db.Timestamp(6)
  deletedAt       DateTime?       @map("DELETED_AT") @db.Timestamp(6)
  employee        EMPLOYEES       @relation(fields: [employeeId], references: [employeeId])
  viettelBranch   VIETTEL_BRANCH? @relation(fields: [viettelBranchId], references: [viettelBranchId])

  @@map("VIETTEL_EMPLOYEES")
}

model VIETTEL_BRANCH {
  id                String              @unique @map("ID") @db.Uuid
  viettelBranchId   Int                 @id @default(autoincrement()) @map("VIETTEL_BRANCH_ID")
  viettelBranchCode String              @unique @map("VIETTEL_BRANCH_CODE")
  viettelBranchName String?             @map("VIETTEL_BRANCH_NAME")
  status            ENUMSTATUS          @default(ENABLE) @map("STATUS")
  createdAt         DateTime            @default(now()) @map("CREATED_AT") @db.Timestamp(6)
  updatedAt         DateTime?           @updatedAt @map("UPDATED_AT") @db.Timestamp(6)
  deletedAt         DateTime?           @map("DELETED_AT") @db.Timestamp(6)
  viettelEmployees  VIETTEL_EMPLOYEES[]

  @@map("VIETTEL_BRANCH")
}

model OTP_TOKENS {
  id        String    @unique @map("ID") @db.Uuid
  email     String    @map("EMAIL")
  otpCode   String    @map("OTP_CODE")
  otpType   OTP_TYPE  @map("OTP_TYPE")
  expiredAt DateTime  @map("EXPIRED_AT")
  createdAt DateTime  @default(now()) @map("CREATED_AT") @db.Timestamp(6)
  deletedAt DateTime? @map("DELETED_AT") @db.Timestamp(6)
  accountId Int?      @map("ACCOUNT_ID")
  account   ACCOUNTS? @relation(fields: [accountId], references: [accountId])

  @@unique([email, otpType])
  @@index([email])
  @@index([accountId])
  @@map("OTP_TOKENS")
}

model REFRESH_TOKENS {
  id        String   @unique @map("ID") @db.Uuid
  tokenId   Int      @id @default(autoincrement()) @map("TOKEN_ID")
  token     String   @map("TOKEN")
  accountId Int      @map("ACCOUNT_ID")
  isRevoked Boolean  @default(false) @map("IS_REVOKED")
  expiresAt DateTime @map("EXPIRES_AT") @db.Timestamp(6)
  createdAt DateTime @default(now()) @map("CREATED_AT") @db.Timestamp(6)
  account   ACCOUNTS @relation(fields: [accountId], references: [accountId])

  @@index([accountId])
  @@index([token])
  @@map("REFRESH_TOKENS")
}

enum OTP_TYPE {
  REGISTER
  RESET_PASSWORD
}

enum NETWORK_STATUS {
  ASSIGNED
  ACTIVE
  INACTIVE
  DISABLED
  CONFLICT
}

enum ENUMSTATUS {
  ENABLE
  DISABLED
}