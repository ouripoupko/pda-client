export interface Contract {
  id: string;
  name: string;
  contract: string;
  code: string;
  protocol: string;
  default_app: string;
  pid: string;
  address: string;

  group: string[];
  threshold: number;
  profile: string;

  constructor: any;
}

export interface Method {
  name: string;
  arguments: string[];
  values: any;
}
