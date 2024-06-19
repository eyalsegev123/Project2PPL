import { ClassExp, ProcExp, Exp, Program, makeProcExp , makeIfExp, CExp, makeStrExp, makeAppExp, makePrimOp, makeVarDecl, makeVarRef, makeBoolExp, isClassExp, isProgram, makeProgram, isDefineExp, makeDefineExp, isBoolExp, isNumExp, isStrExp, isLitExp, isVarDecl, isVarRef, isIfExp, isAppExp, unparseL3, isPrimOp, isExp, isCExp, isAtomicExp, isProcExp, isLetExp, makeLetExp, makeBinding } from "./L3-ast";
import { Result, makeFailure , makeOk} from "../shared/result";
import { map, range } from "ramda";


/*
Purpose: Transform ClassExp to ProcExp
Signature: class2proc(classExp)
Type: ClassExp => ProcExp
*/
export const class2proc = (exp: ClassExp): ProcExp =>{
    const ifExps = exp.methods.reduceRight((acc : CExp, b) =>
        makeIfExp(makeAppExp(makePrimOp("eq?"), [makeVarRef("msg"), makePrimOp("'" + b.var.var)]), makeAppExp(b.val,[]), acc)
        , makeBoolExp(false));
        
    const ProcMsg = makeProcExp([makeVarDecl("msg")], [ifExps]);
    return makeProcExp(exp.fields,[ProcMsg]);
    

}


/*
Purpose: Transform all class forms in the given AST to procs
Signature: lexTransform(AST)
Type: [Exp | Program] => Result<Exp | Program>
*/

export const lexTransform = (exp: Exp | Program): Result<Exp | Program> =>
    makeOk(transformClass(exp));


export const transformClass = (exp:Program | Exp) : Program | Exp =>  
    isExp(exp) ? transformClassExp(exp) :
    isProgram(exp) ? makeProgram(map(transformClassExp, exp.exps)) :
    exp;

export const transformClassExp = (exp : Exp) : Exp =>
    isCExp(exp) ? transformClassCExp(exp) :
    isDefineExp(exp) ? makeDefineExp(exp.var,transformClassCExp(exp.val)):
    exp;

export const transformClassCExp = (exp:CExp) : CExp => {

    return isAtomicExp(exp) ? exp :
    isLitExp(exp) ? exp :
    isIfExp(exp) ? makeIfExp(transformClassCExp(exp.test),
                            transformClassCExp(exp.then),
                            transformClassCExp(exp.alt)) :
    isAppExp(exp) ? makeAppExp(transformClassCExp(exp.rator),
                               map(transformClassCExp, exp.rands)) :
    isProcExp(exp) ? makeProcExp(exp.args, map(transformClassCExp, exp.body)) :
    isLetExp(exp) ? makeLetExp(map(b => makeBinding(b.var.var,transformClassCExp(b.val)),exp.bindings)
                              ,map(transformClassCExp,exp.body)):
    isClassExp(exp) ? class2proc(exp) : 
    exp;
}