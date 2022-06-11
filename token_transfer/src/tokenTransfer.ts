import {
    CanisterResult,
    ic,
    nat32,
    nat64,
    ok,
    Opt,
    Principal,
    UpdateAsync,
    Variant
} from 'azle';
import {
    Address,
    Archives,
    binary_address_from_address,
    DecimalsResult,
    GetBlocksArgs,
    Ledger,
    NameResult,
    QueryBlocksResponse,
    SymbolResult,
    Tokens,
    TransferFee,
    TransferResult
} from 'azle/canisters/ledger';

type GetAccountBalanceResult = Variant<{
    ok: Tokens;
    err: string;
}>;

const ICPCanister = ic.canisters.Ledger<Ledger>(Principal.fromText('ryjl3-tyaaa-aaaaa-aaaba-cai'));


export function* get_account_balance(address: Address): UpdateAsync<GetAccountBalanceResult> {
    const tokens_canister_result: CanisterResult<Tokens> = yield ICPCanister.account_balance({
        account: binary_address_from_address(address)
    });

    if (!ok(tokens_canister_result)) {
        return {
            err: tokens_canister_result.err
        };
    }

    const tokens = tokens_canister_result.ok;

    return {
        ok: tokens
    };
}
