import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { parseCookies } from "nookies";

// Higher-order functions -> Função que retorna uma função ou recebe como parametro uma função
export function withSSRGuest<P>(fn: GetServerSideProps<P>): GetServerSideProps {
  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
    const cookies = parseCookies(ctx);

    if(cookies['nextauth.token']) {
      return {
        redirect: {
          destination: '/dashboard',
          permanent: false,
        }
      }
    }

    return await fn(ctx);
  }
}