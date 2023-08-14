export interface Contract {
  id: string;
  name: string;
  profile: string;
  contract: string;
  code: string;
  protocol: string;
  default_app: string;
  members: string[];
  methods: Method[];
  values: any[];
  pid: string;
  address: string;
  group: string[];
  threshold: number;
}

export interface Method {
  name: string;
  arguments: string[];
  values: any;
}
