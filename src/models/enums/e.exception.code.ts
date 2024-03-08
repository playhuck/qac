export const NOT_FOUND_URL_STATUS_CODE = 499;

export enum ECustomExceptionCode {

  /** 중복된 아이디입니다. */ 'USER-001' = 'USER-001',
  /** 존재하지 않는 유저 */ 'USER-002' = 'USER-002',

  /** 비밀번호 불일치 */ 'INCORECT-PWD' = 'INCORECT-PWD',
  /** DB 비밀번호 불일치 */ 'INCORECT-DB-PWD' = 'INCORECT-DB-PWD',

  /** TOKEN 자체가 없는 경우 */ 'JWT-001' = 'JWT-001',
  /** TOKEN TYPE 불일치 */ 'JWT-002' = 'JWT-002',

  'AWS-RDS-EXCEPTION' = 'AWS-RDS-EXCEPTION',

  /** MARIA DB Pool 또는 Connection 관련 에러 */
  'DB-CONNECTION-EXCEPTION' = 'DB-CONNECTION-EXCEPTION',
 
  /** 예외처리 하지 못한 경우 */
  'UNKNOWN-SERVER-ERROR' = 'UNKNOWN-SERVER-ERROR',
  'INTERVAL-SERVER-ERROR' = 'INTERVAL-SERVER-ERROR',

}